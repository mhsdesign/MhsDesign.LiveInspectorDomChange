<?php declare(strict_types=1);
namespace MhsDesign\LiveInspectorDomChange\Fusion\Editable;

/*
 * This file is part of the MhsDesign.LiveInspectorDomChange package
 */

use Neos\Flow\Annotations as Flow;
use Neos\Eel\ProtectedContextAwareInterface;
use Neos\ContentRepository\Domain\Model\NodeInterface;

/**
 * @Flow\Scope("singleton")
 */
final class Editable implements ProtectedContextAwareInterface
{
    /**
     * @param NodeInterface $node
     * @param string $propName
     * @param string $changerFunction
     * @param mixed $changerArguments
     * @return array
     */
    public function attributes(NodeInterface $node, $propName, $changerFunction, $changerArguments = null): array
    {
        $inBackend = $node->getContext()->isInBackend();

        if ($inBackend === false)
            return [];

        $content = [];
        $content[$propName] = ["function" => $changerFunction];

        if($changerArguments) {
            $content[$propName]["arguments"] = $changerArguments;
        }

        $jsonContent = json_encode($content);
        $hashForFusion = hash("crc32", $propName);

        $outputAttributes = ["data-__has_change-props" => true];
        $outputAttributes["data-__change-props-" . $hashForFusion] = $jsonContent;

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
