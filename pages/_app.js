import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap 樣式
import "../utils/chartjs-setup";               // 引入 Chart.js 全域設定

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* 也可以在這裡引入其他 meta 或字體 */}
        <title>Issue Management</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
