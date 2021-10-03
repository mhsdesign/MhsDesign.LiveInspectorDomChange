<?php declare(strict_types=1);
namespace MhsDesign\LiveInspectorDomChange\Tests\Unit\Fusion;

/*
 * This file is part of the MhsDesign.LiveInspectorDomChange package.
 *
 * (c) Marc Henry Schultz
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Neos\Domain\Service\ContentContext;
use MhsDesign\LiveInspectorDomChange\Fusion\Editable\Editable;
use MhsDesign\LiveInspectorDomChange\Exception\EditableException;
use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeType;
use Neos\Neos\Domain\Model\UserInterfaceMode;

class EditableTest extends \Neos\Flow\Tests\UnitTestCase
{

    /**
     * Same hashing as used inside the Editable Helper
     */
    static protected function hash(string $propName): string
    {
        return hash("crc32", $propName);
    }

    /**
     * Build a mock Node for testing
     */
    protected function buildNodeMock(array $nodeData): NodeInterface
    {
        $inBackend = $nodeData['inBackend'];
        $contextPath = $nodeData['contextPath'];
        $properties = $nodeData['properties'];

        $userInterfaceMode = $this->getMockBuilder(UserInterfaceMode::class)->disableOriginalConstructor()->getMock();
        $userInterfaceMode->method('isEdit')->willReturn($inBackend);

        $mockContext = $this->getMockBuilder(ContentContext::class)->disableOriginalConstructor()->getMock();
        $mockContext->method('isInBackend')->willReturn($inBackend);
        $mockContext->method('getCurrentRenderingMode')->willReturn($userInterfaceMode);

        $propertiesConfiguration = array_map(function($value) { return 'properties.' . $value; }, $properties);
        $hasConfiguration = function($argConfigurationPath) use ($propertiesConfiguration) {
            if (substr($argConfigurationPath, 0, 11) !== 'properties.') {
                self::fail('the mocked "hasConfiguration()" works only with "properties."');
            }
            return array_search($argConfigurationPath, $propertiesConfiguration);
        };
        $mockNodeType = $this->getMockBuilder(NodeType::class)->disableOriginalConstructor()->getMock();
        $mockNodeType->method('hasConfiguration')->will(self::returnCallback($hasConfiguration));

        $mockNode = $this->getMockBuilder(NodeInterface::class)->getMock();
        $mockNode->method('getContextPath')->willReturn($contextPath);
        $mockNode->method('getContext')->willReturn($mockContext);
        $mockNode->method('getNodeType')->willReturn($mockNodeType);

        return $mockNode;
    }

    public function attributesExamples()
    {
        return [

            'noOutputIfSiteIsLive' => [
                'node' => ['inBackend' => false, 'contextPath' => '/sites/test/main/node123456@user;language=de_DE', 'properties' => ['text']],
                'prop' => 'text',
                'func' => 'changeText',
                'args' => null,
                'outp' => []
            ],

            'propertyChanger' => [
                'node' => ['inBackend' => true, 'contextPath' => '/sites/test/main/node123456@user;language=de_DE', 'properties' => ['text']],
                'prop' => 'text',
                'func' => 'changeText',
                'args' => null,
                'outp' => [
                    'data-__change-contextpath' => '/sites/test/main/node123456@user;language=de_DE',
                    'data-__change-prop-'.self::hash('text') => '{"text":{"function":"changeText"}}',
                ]
            ],

            'propertyChangerStringArg' => [
                'node' => ['inBackend' => true, 'contextPath' => '/sites/test/main/node123456@user;language=de_DE', 'properties' => ['color']],
                'prop' => 'color',
                'func' => 'changeStyle',
                'args' => 'backgroundColor',
                'outp' => [
                    'data-__change-contextpath' => '/sites/test/main/node123456@user;language=de_DE',
                    'data-__change-prop-'.self::hash('color') => '{"color":{"function":"changeStyle","arguments":"backgroundColor"}}',
                ]
            ],

            'propertyChangerArrayObjectArg' => [
                'node' => ['inBackend' => true, 'contextPath' => '/sites/test/main/node123456@user;language=de_DE', 'properties' => ['example']],
                'prop' => 'example',
                'func' => 'changeCustom',
                'args' => ['something' => 'custom'],
                'outp' => [
                    'data-__change-contextpath' => '/sites/test/main/node123456@user;language=de_DE',
                    'data-__change-prop-'.self::hash('example') => '{"example":{"function":"changeCustom","arguments":{"something":"custom"}}}',
                ]
            ],

        ];
    }

    /**
     * @test
     * @dataProvider attributesExamples
     */
    public function evaluateTests($nodeData, $propName, $changerFunction, $changerArguments, $expectedOutput)
    {
        $mockNode = $this->buildNodeMock($nodeData);

        $editable = new Editable();
        $attributes = $editable->attributes($mockNode, $propName, $changerFunction, $changerArguments);

        self::assertEquals($expectedOutput, $attributes);
    }

    /**
     * @test
     */
    public function throwWhenNodeHasNotProperty()
    {
        self::expectException(EditableException::class);

        $nodeData = [
            'inBackend' => true,
            'contextPath' => '/sites/test/main/node123456@user;language=de_DE',
            'properties' => ['buttonText', 'image']
        ];

        $mockNode = $this->buildNodeMock($nodeData);

        $editable = new Editable();
        $attributes = $editable->attributes($mockNode, 'text', 'changeText');
    }
}
