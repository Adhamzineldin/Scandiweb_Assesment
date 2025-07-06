<?php

namespace Scandiweb\Model\Product;

class GenericProduct extends AbstractProduct
{
    public function getProductType(): string
    {
        return 'generic';
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['productType'] = $this->getProductType();
        return $baseArray;
    }
} 