import ReactDOM from 'react-dom/client';
import App from './App';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const client = new ApolloClient({
    uri: 'https://app8080.maayn.me/graphql', // Correct endpoint for backend GraphQL
    cache: new InMemoryCache(),
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
);
