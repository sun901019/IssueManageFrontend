import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap 樣式
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/globals.css";
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 確保Bootstrap的JavaScript在客戶端加載
    if (typeof window !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  return (
    <>
      <Head>
        <title>問題管理系統</title>
      </Head>
      <div className="app-container">
        <main className="app-main">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}

export default MyApp;
