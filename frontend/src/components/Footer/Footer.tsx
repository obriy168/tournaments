import { Link } from "react-router-dom";

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              Skyline
            </Link>
            <p className={styles.tagline}>Online tournaments platform</p>
          </div>
          <div className={styles.links}>
            <div className={styles.column}>
              <h4 className={styles.heading}>Account</h4>
              <Link to="/signup" className={styles.link}>
                Sign up
              </Link>
              <Link to="/login" className={styles.link}>
                Log in
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>© 2026 Skyline.</p>
          <div className={styles.legal}>
            <Link to="/privacy" className={styles.legal__link}>
              Privacy and Cookie Policy
            </Link>
            <Link to="/terms" className={styles.legal__link}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterMinimal() {
  return (
    <footer className={styles.footer__minimal}>
      <div className={styles.container}>
        <p className={styles.copyright}>© 2026 Skyline.</p>
        <div className={styles.legal}>
          <Link to="/privacy" className={styles.legal__link}>
            Privacy and Cookie Policy
          </Link>
          <Link to="/terms" className={styles.legal__link}>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
