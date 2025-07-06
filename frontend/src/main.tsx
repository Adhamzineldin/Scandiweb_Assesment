import ReactDOM from 'react-dom/client';
import App from './App';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

// Dynamic GraphQL endpoint based on current host
const getGraphQLEndpoint = () => {
    // Check for environment variable first (for tests and deployment)
    if (typeof window !== 'undefined' && (window as any).__GRAPHQL_ENDPOINT__) {
        return (window as any).__GRAPHQL_ENDPOINT__;
    }

    const currentHost = window.location.hostname;
    const currentPort = window.location.port;

    console.log(`[GraphQL] Detecting endpoint - Host: ${currentHost}, Port: ${currentPort}`);

    // If running locally (broader detection for tests)
    if (currentHost === 'localhost' ||
        currentHost === '127.0.0.1' ||
        currentHost.includes('localhost') ||
        currentHost === '0.0.0.0') {
        console.log('[GraphQL] Using local backend endpoint');
        return 'http://localhost:8080/graphql';
    }


    if (currentHost.includes('maayn.me')) {
        console.log('[GraphQL] Using maayn.me backend endpoint');
        return 'https://app8080.maayn.me/graphql';
    }
    
    console.log('[GraphQL] Using fallback endpoint (prefer local for development)');
    return 'http://localhost:8080/graphql';
};

const graphqlEndpoint = getGraphQLEndpoint();
console.log(`[GraphQL] Using endpoint: ${graphqlEndpoint}`);

const client = new ApolloClient({
    uri: graphqlEndpoint,
    cache: new InMemoryCache({
        typePolicies: {
            Product: {
                keyFields: ['id'],
                fields: {
                    gallery: {
                        merge: false,
                    },
                    attributes: {
                        merge: false,
                    },
                    prices: {
                        merge: false,
                    },
                },
            },
            // Completely disable normalization for all attribute-related types
            Attribute: {
                keyFields: false,
            },
            AttributeSet: {
                keyFields: false,
            },
            AttributeItem: {
                keyFields: false,
            },
        },
        // Disable result caching completely for attributes
        resultCaching: false,
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first', // Better for tests - cache-first instead of network-only
        },
        query: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first', // Better for tests - cache-first instead of network-only
        },
    },
    // Add connection timeout
    connectToDevTools: false,
    // Add timeout for test reliability
    link: undefined, // Will use default HTTP link with timeout
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);
