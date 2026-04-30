import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import InvoicesPage from './pages/InvoicesPage'
import NewInvoicePage from './pages/NewInvoicePage'
import MenuPage from './pages/MenuPage'

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<InvoicesPage />} />
          <Route path="/new" element={<NewInvoicePage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
