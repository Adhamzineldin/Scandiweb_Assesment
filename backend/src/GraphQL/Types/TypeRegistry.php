<?php

namespace src\GraphQL\Types;

use src\GraphQL\Types\AttributeType;
use src\GraphQL\Types\AttributeSetType;
use src\GraphQL\Types\CategoryType;
use src\GraphQL\Types\CreateOrderResponseType;
use src\GraphQL\Types\CurrencyType;
use src\GraphQL\Types\OrderItemType;
use src\GraphQL\Types\OrderType;
use src\GraphQL\Types\PriceType;
use src\GraphQL\Types\ProductType;

class TypeRegistry
{
    private static $currency = null;
    private static $price = null;
    private static $attribute = null;
    private static $attributeSet = null;
    private static $category = null;
    private static $product = null;
    private static $orderItem = null;
    private static $order = null;
    private static $createOrderResponse = null;

    public static function currency(): CurrencyType
    {
        return self::$currency ?: (self::$currency = new CurrencyType());
    }

    public static function price(): PriceType
    {
        return self::$price ?: (self::$price = new PriceType());
    }

    public static function attribute(): AttributeType
    {
        return self::$attribute ?: (self::$attribute = new AttributeType());
    }

    public static function attributeSet(): AttributeSetType
    {
        return self::$attributeSet ?: (self::$attributeSet = new AttributeSetType());
    }

    public static function category(): CategoryType
    {
        return self::$category ?: (self::$category = new CategoryType());
    }

    public static function product(): ProductType
    {
        return self::$product ?: (self::$product = new ProductType());
    }

    public static function orderItem(): OrderItemType
    {
        return self::$orderItem ?: (self::$orderItem = new OrderItemType());
    }

    public static function order(): OrderType
    {
        return self::$order ?: (self::$order = new OrderType());
    }

    public static function createOrderResponse(): CreateOrderResponseType
    {
        return self::$createOrderResponse ?: (self::$createOrderResponse = new CreateOrderResponseType());
    }
} 