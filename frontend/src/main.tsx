import ReactDOM from 'react-dom/client';
import App from './App';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

// Dynamic GraphQL endpoint based on current host
const getGraphQLEndpoint = () => {
    const currentHost = window.location.hostname;
    
    // If running locally
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:8080/graphql';
    }
    
    // If running on maayn.me subdomain, use corresponding backend port
    if (currentHost.includes('maayn.me')) {
        return 'https://app8080.maayn.me/graphql';
    }
    
    // Default fallback
    return 'https://app8080.maayn.me/graphql';
};

const graphqlEndpoint = getGraphQLEndpoint();

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
            fetchPolicy: 'network-only', // Force fresh data every time
        },
        query: {
            errorPolicy: 'all',
            fetchPolicy: 'network-only', // Force fresh data every time
        },
    },
    // Add connection timeout
    connectToDevTools: false,
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);
