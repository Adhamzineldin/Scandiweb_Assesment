<?php

namespace src\Model\Product;

class ClothingProduct extends AbstractProduct
{
    public function getProductType(): string
    {
        return 'clothing';
    }

    public function getSizeAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => $attrSet->getName() === 'Size');
    }

    public function getColorAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => $attrSet->getName() === 'Color');
    }

    public function getMaterialAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => $attrSet->getName() === 'Material');
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['productType'] = $this->getProductType();
        return $baseArray;
    }
} 