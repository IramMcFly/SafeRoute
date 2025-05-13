"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/");
  };

  const handleRegister = () => {
    router.push("/");
  };

  const handleDemo = () => {
    router.push("/selector");
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoWrapper}>
        <Image
          src="/images/shield-check.png"
          alt="SafeRoute Logo"
          width={100}
          height={100}
        />
      </div>
      <h1 style={styles.title}>SafeRoute</h1>
      <p style={styles.subtitle}>Llega seguro a tu destino</p>

      <button style={styles.loginButton} onClick={handleLogin}>
        Iniciar sesión
      </button>

      <button style={styles.registerButton} onClick={handleRegister}>
        Registrarse
      </button>

      <button style={styles.demoButton} onClick={handleDemo}>
        Demostración
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "0 20px",
    textAlign: "center",
  },
  logoWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
    color: "#000",
  },
  subtitle: {
    fontSize: "18px",
    margin: "10px 0 30px 0",
    color: "#000",
  },
  loginButton: {
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    maxWidth: "280px",
    cursor: "pointer",
  },
  registerButton: {
    backgroundColor: "#fff",
    color: "#1976d2",
    border: "2px solid #1976d2",
    padding: "10px 22px",
    borderRadius: "10px",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    maxWidth: "280px",
    cursor: "pointer",
  },
  demoButton: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    border: "1px dashed #1976d2",
    padding: "10px 22px",
    borderRadius: "10px",
    fontSize: "16px",
    width: "100%",
    maxWidth: "280px",
    cursor: "pointer",
  },
};
