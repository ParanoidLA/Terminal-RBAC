import React, { useState } from "react";
import { signup, login, updateUser, fetchUserDetails, addIPToUser, updatePassword, changeRole } from "./auth";

const App = () => {
  const [output, setOutput] = useState(["Welcome to the RBAC Terminal App"]);
  const [command, setCommand] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(""); // Track the email
  const [role, setRole] = useState(""); // Track user role
  const [stage, setStage] = useState(""); // Stage for login/signup flow
  const [tempInput, setTempInput] = useState(""); // Holds temporary values

  const handleCommand = async (e) => {
  e.preventDefault();
  const trimmedCommand = command.trim().toLowerCase();

  // Handle login/signup stages
  if (!isLoggedIn) {
    if (trimmedCommand === "login") {
      setOutput((prev) => [
        ...prev,
        `> ${command}`,
        "Please enter your email: ",
      ]);
      setStage("email");
      setCommand(""); // Clear the command
    } else if (stage === "email") {
      setTempInput(command.trim()); // Save the email
      setOutput((prev) => [
        ...prev,
        `> Email: ${command.trim()}`,
        "Please enter your password: ",
      ]);
      setStage("password");
      setCommand(""); // Clear the command
    } else if (stage === "password") {
      try {
        await login(tempInput, command.trim());
        const userDetails = await fetchUserDetails(tempInput);
        if (userDetails) {
          setEmail(tempInput);
          setRole(userDetails.roles[0]);
          setIsLoggedIn(true);
          setOutput((prev) => [
            ...prev,
            `> Password: ********`,
            `Welcome back, ${tempInput}!`,
          ]);
        } else {
          setOutput((prev) => [
            ...prev,
            `> Password: ********`,
            "Login failed. Please check your credentials.",
          ]);
          setStage(""); // Reset stage
        }
      } catch (error) {
        setOutput((prev) => [...prev, `Error: ${error.message}`]);
      }
      setCommand("");
    } else if (trimmedCommand === "signup") {
      setOutput((prev) => [...prev, `> ${command}`, "Please enter email for signup: "]);
      setStage("signup_email");
      setCommand("");
    } else if (stage === "signup_email") {
      setTempInput(command.trim());
      setOutput((prev) => [
        ...prev,
        `> Email: ${command.trim()}`,
        "Please enter a password for signup: ",
      ]);
      setStage("signup_password");
      setCommand("");
    } else if (stage === "signup_password") {
      await signup(tempInput, command.trim());
      setOutput((prev) => [
        ...prev,
        `> Password: ********`,
        `Signup successful for ${tempInput}`,
      ]);
      setStage(""); // Reset stage
      setCommand("");
    }
    return;
  }

  // Check if the user has permission to execute the command
  if (!hasPermission(role, trimmedCommand)) {
    setOutput((prev) => [
      ...prev,
      `> ${command}`,
      "You don't have permission to execute this command.",
    ]);
    return; // Don't clear the command if permission is denied
  }

  // Commands for logged-in users
  if (trimmedCommand === "whoami") {
    const userDetails = await fetchUserDetails(email);
    setOutput((prev) => [
      ...prev,
      `> whoami`,
      `Logged in as: ${userDetails.email}, Role: ${userDetails.roles[0]}`,
    ]);
  } else if (trimmedCommand === "logs" && role === "moderator") {
    setOutput((prev) => [
      ...prev,
      `> logs`,
      "Displaying logs for moderator...",
      "Demo log 1: User login success",
      "Demo log 2: Password update attempt",
    ]);
  } else if (trimmedCommand === "view-roles" && role === "admin") {
    const users = await fetchUserDetails(); // Fetch all users here
    const roleTable = users.map(user => `${user.email} - ${user.roles[0]}`).join("\n");
    setOutput((prev) => [
      ...prev,
      `> view-roles`,
      "User Roles:",
      roleTable,
    ]);
  }

  setCommand(""); // Reset input field after command is handled
};

const hasPermission = (role, command) => {
  // Check permissions based on the user's role
  if (role === "admin") {
    return true; // Admin has all permissions
  }
  if (role === "moderator" && command === "logs") {
    return true; // Moderators can view logs
  }
  if (role === "user" && command === "whoami") {
    return true; // Regular users can view whoami
  }
  if (role === "moderator" && command === "whoami") {
    return true; // Moderators can also view their own info
  }
  return false; // Default: no permission
};

  return (
    <div style={styles.container}>
      <div style={styles.terminal}>
        {output.map((line, index) => (
          <pre key={index}>{line}</pre>
        ))}
        <form onSubmit={handleCommand} style={styles.form}>
          <span style={styles.prompt}>{isLoggedIn ? `${email}$` : `$`}</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            style={styles.input}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#000",
    color: "#0f0",
    fontFamily: "monospace",
  },
  terminal: {
    width: "80%",
    maxHeight: "80vh",
    overflowY: "auto",
    padding: "1rem",
    border: "2px solid #0f0",
  },
  form: {
    display: "flex",
    alignItems: "center",
  },
  prompt: {
    marginRight: "0.5rem",
  },
  input: {
    flex: 1,
    backgroundColor: "#000",
    color: "#0f0",
    border: "none",
    outline: "none",
    fontFamily: "monospace",
    fontSize: "1rem",
  },
};

export default App;