<?php

namespace src\Model\Product;

class TechProduct extends AbstractProduct
{
    public function getProductType(): string
    {
        return 'tech';
    }

    public function getCapacityAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => $attrSet->getName() === 'Capacity');
    }

    public function getColorAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => $attrSet->getName() === 'Color');
    }

    public function getFeatureAttributes(): array
    {
        $attributeSets = $this->getAttributeSets();
        return array_filter($attributeSets, fn($attrSet) => 
            in_array($attrSet->getName(), ['With USB 3 ports', 'Touch ID in keyboard', 'Wireless'])
        );
    }

    public function getWarrantyInfo(): string
    {
        // Tech products typically have warranty information
        return "Standard 1-year warranty";
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['productType'] = $this->getProductType();
        $baseArray['warrantyInfo'] = $this->getWarrantyInfo();
        return $baseArray;
    }
} 