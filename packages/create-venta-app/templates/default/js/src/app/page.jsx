import { RootLayout } from './components/layout.jsx';
import styles from "./page.module.css";

export default function Home() {
  return (
    <RootLayout>
      <main className={styles.main}>
        <a href='https://ventajs.dev/docs' target='_blank' rel='noreferrer'>
          <button className={styles.button}>
            View Documentation
            <span className={styles.icon} />
          </button>
        </a>
        <div>
          <div className={styles.radialGradientOverlay} />
          <p className={styles.radialGradientText}>
            Venta.js
          </p>
        </div>
        <div className={styles.content}>
          <p>
            Change this page by editing {' '}
            <code className={styles.code}>app/page.jsx</code>
          </p>
        </div>
      </main>
    </RootLayout>
  );
}
