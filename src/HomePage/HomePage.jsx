import { useState } from "react";
import axios from "axios";

const HomePage = () => {
 const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateLink = async () => {
    if (!name || !rollNumber) {
      alert("Please enter all fields");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/generate-test-link`,
        { name, rollNumber }
      );

      setResult(res.data);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.details || err.message;
      alert(apiMessage || "Error generating link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🎯 Student Test Registration</h2>

        <input
          style={styles.input}
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
        />

        <button style={styles.button} onClick={generateLink}>
          {loading ? "Generating..." : "Generate Test Link"}
        </button>

        {result && (
          <div style={styles.result}>
            <p><b>AON ID:</b> {result.aon_id}</p>

            {result.test_link ? (
              <a
                href={result.test_link}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                🚀 Start Test
              </a>
            ) : (
              <>
                <p style={{ color: "red" }}>
                  ⚠ Test link not returned from API
                </p>
                {result.api_response && (
                  <pre style={styles.debug}>
                    {JSON.stringify(result.api_response, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f7fb",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  debug: {
    marginTop: "15px",
    padding: "10px",
    textAlign: "left",
    background: "#f8f9fc",
    color: "#333",
    borderRadius: "8px",
    fontSize: "12px",
    overflowX: "auto",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
  },
  link: {
    display: "block",
    marginTop: "10px",
    color: "green",
    fontWeight: "bold",
  },
};

export default HomePage