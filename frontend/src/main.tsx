import ReactDOM from 'react-dom/client';
import App from './App';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

// Dynamic GraphQL endpoint based on current host
const getGraphQLEndpoint = () => {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If running locally
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:8080/graphql';
    }
    
    // If running on maayn.me subdomain, use corresponding backend port
    if (currentHost.includes('maayn.me')) {
        // Extract the port from the frontend subdomain and map to backend
        if (currentHost.includes('test3000')) {
            return 'https://app8080.maayn.me/graphql';
        }
        if (currentHost.includes('app3000')) {
            return 'https://app8080.maayn.me/graphql';
        }
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
                fields: {
                    gallery: {
                        merge: false, // Don't merge arrays, replace them
                    },
                    attributes: {
                        merge: false,
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first',
        },
        query: {
            errorPolicy: 'all',
            fetchPolicy: 'cache-first',
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
