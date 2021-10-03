<?php declare(strict_types=1);
namespace MhsDesign\LiveInspectorDomChange\Fusion\Editable;

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
use MhsDesign\LiveInspectorDomChange\Exception\EditableException;
use Neos\Flow\Annotations as Flow;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\Eel\ProtectedContextAwareInterface;

final class Editable implements ProtectedContextAwareInterface
{
    /**
     * @param NodeInterface $node
     * @param string $propName
     * @param string $changerFunction
     * @param mixed $changerArguments
     * @return array
     * @throws EditableException
     */
    public function attributes(NodeInterface $node, string $propName, string $changerFunction, $changerArguments = null): array
    {
        /** @var ContentContext $context */
        $context = $node->getContext();
        $inBackend = $context->isInBackend();
        $inEditMode = $context->getCurrentRenderingMode()->isEdit();

        if ($inBackend === false || $inEditMode === false)
            return [];

        $nodeContextPath = $node->getContextPath();

        if ($node->getNodeType()->hasConfiguration('properties.' . $propName) === false)
            throw new EditableException(sprintf('Cant make the property "%s" of node "%s" editable since its not declared in the nodeType', $propName, $nodeContextPath, ), 1632046743);

        $content[$propName] = ['function' => $changerFunction];

        if ($changerArguments !== null)
            $content[$propName]['arguments'] = $changerArguments;

        $jsonContent = json_encode($content);
        $hash = hash('crc32', $propName);

        // only one cr node with changeable props per dom node.
        $outputAttributes = ['data-__change-contextpath' => $nodeContextPath];
        // the hash to not interfere with multiple attributes.
        $outputAttributes['data-__change-prop-' . $hash] = $jsonContent;

        return $outputAttributes;
    }

    /**
     * @param string $methodName
     * @return boolean
     */
    public function allowsCallOfMethod($methodName)
    {
        return true;
    }
}
