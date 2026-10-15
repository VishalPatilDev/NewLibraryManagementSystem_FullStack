import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ApiContextProvider from "./context/ApiContext";
// import {
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";


// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       // Don't refetch every time the browser window gets focus.
//       refetchOnWindowFocus: false,

//       // Keep successful data fresh for 30 seconds.
//       staleTime: 30 * 1000,

//       // Retry failed requests twice.
//       retry: 2,
//     },
//   },
// });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiContextProvider>
      {/* <QueryClientProvider client={queryClient}> */}
        <App />
      {/* </QueryClientProvider> */}
    </ApiContextProvider>
  </StrictMode>,
)
