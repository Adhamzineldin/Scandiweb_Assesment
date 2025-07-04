<?php

namespace src\Controller;

use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use RuntimeException;
use src\GraphQL\Resolvers\MutationResolver;
use src\GraphQL\Resolvers\QueryResolver;
use src\GraphQL\Types\TypeRegistry;
use Throwable;

class GraphQL
{
    static public function handle()
    {
        try {
            $queryType = new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'categories' => [
                        'type' => Type::listOf(TypeRegistry::category()),
                        'description' => 'Get all categories',
                        'resolve' => [QueryResolver::class, 'categories']
                    ],
                    'category' => [
                        'type' => TypeRegistry::category(),
                        'description' => 'Get a category by ID or name',
                        'args' => [
                            'id' => ['type' => Type::int()],
                            'name' => ['type' => Type::string()]
                        ],
                        'resolve' => [QueryResolver::class, 'category']
                    ],
                    'products' => [
                        'type' => Type::listOf(TypeRegistry::product()),
                        'description' => 'Get products with optional filtering',
                        'args' => [
                            'categoryId' => ['type' => Type::int()],
                            'categoryName' => ['type' => Type::string()],
                            'inStock' => ['type' => Type::boolean()],
                            'brand' => ['type' => Type::string()],
                            'sortBy' => ['type' => Type::string()],
                            'sortOrder' => ['type' => Type::string()],
                            'limit' => ['type' => Type::int()]
                        ],
                        'resolve' => [QueryResolver::class, 'products']
                    ],
                    'product' => [
                        'type' => TypeRegistry::product(),
                        'description' => 'Get a product by ID',
                        'args' => [
                            'id' => ['type' => Type::nonNull(Type::string())]
                        ],
                        'resolve' => [QueryResolver::class, 'product']
                    ]
                ],
            ]);

            $mutationType = new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'createOrder' => [
                        'type' => TypeRegistry::createOrderResponse(),
                        'description' => 'Create a new order',
                        'args' => [
                            'input' => [
                                'type' => Type::nonNull(new \GraphQL\Type\Definition\InputObjectType([
                                    'name' => 'CreateOrderInput',
                                    'fields' => [
                                        'customerEmail' => ['type' => Type::nonNull(Type::string())],
                                        'customerName' => ['type' => Type::nonNull(Type::string())],
                                        'items' => [
                                            'type' => Type::nonNull(Type::listOf(new \GraphQL\Type\Definition\InputObjectType([
                                                'name' => 'OrderItemInput',
                                                'fields' => [
                                                    'productId' => ['type' => Type::nonNull(Type::string())],
                                                    'quantity' => ['type' => Type::nonNull(Type::int())],
                                                    'selectedAttributes' => ['type' => Type::string()]
                                                ]
                                            ])))
                                        ]
                                    ]
                                ]))
                            ]
                        ],
                        'resolve' => [MutationResolver::class, 'createOrder']
                    ]
                ],
            ]);

            // See docs on schema options:
            // https://webonyx.github.io/graphql-php/schema-definition/#configuration-options
            $schema = new Schema(
                (new SchemaConfig())
                    ->setQuery($queryType)
                    ->setMutation($mutationType)
            );

            // Handle both web requests and test environment
            $rawInput = file_get_contents('php://input');
            if ($rawInput === false || empty($rawInput)) {
                // Fallback for test environment
                $rawInput = $GLOBALS['HTTP_RAW_POST_DATA'] ?? null;
            }
            
            if (empty($rawInput)) {
                throw new RuntimeException('No input data provided');
            }

            $input = json_decode($rawInput, true);
            $query = $input['query'];
            $variableValues = $input['variables'] ?? null;

            $rootValue = ['prefix' => 'You said: '];
            $result = GraphQLBase::executeQuery($schema, $query, $rootValue, null, $variableValues);
            $output = $result->toArray();
        } catch (Throwable $e) {
            $output = [
                'error' => [
                    'message' => $e->getMessage(),
                ],
            ];
        }

        // Only set headers if not in test environment
        if (!isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
            header('Content-Type: application/json; charset=UTF-8');
        }
        return json_encode($output);
    }
}