import { auth, db } from './firebase'; // Import your Firebase config
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// Function to get the user's IP address
const getUserIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
  }
};

// Sign-up function to create a new user
const signup = async (email, password) => {
  try {
    const ipAddress = await getUserIP(); // Get the user's IP address

    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user details in Firestore
    const userRef = doc(db, 'users', email); // Use email as the document ID

    await setDoc(userRef, {
      email: user.email,
      username: user.email.split('@')[0], // Username is the part before '@'
      password, // Make sure to hash the password before storing it if you plan on storing passwords
      action_password: 'areyousureaboutthat',
      roles: ['user'], // Default role
      role_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Role expiry after 1 year
      ip_addresses: [ipAddress],
      name: '', // Optional: Add user's name
      date_of_joining: new Date(),
    });

    console.log('User created successfully!');
  } catch (error) {
    console.error('Error signing up:', error.message);
  }
};

// Login function to authenticate the user and fetch additional user details
const login = async (email, password) => {
  try {
    // Sign in the user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Retrieve user details from Firestore
    const userRef = doc(db, 'users', email);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('User data retrieved:', userData);
      return userData;
    } else {
      console.log('User does not exist');
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
  }
};

// Update user details (e.g., updating the role, name, etc.)
const updateUser = async (email, updatedData) => {
  try {
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, updatedData);
    console.log('User details updated successfully');
  } catch (error) {
    console.error('Error updating user:', error.message);
  }
};

// Update the user's password
const updatePassword = async (email, newPassword) => {
  try {
    const userRef = doc(db, 'users', email);
    await firebaseUpdatePassword(auth.currentUser, newPassword); // Update password via Firebase Auth
    await updateDoc(userRef, { password: newPassword }); // Update Firestore with the new password
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error.message);
  }
};

// Change the role of another user (only accessible to Admin)
const changeRole = async (email, newRole) => {
  try {
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, { roles: [newRole] }); // Update user's role in Firestore
    console.log('Role updated successfully');
  } catch (error) {
    console.error('Error updating role:', error.message);
  }
};

// Fetch all user details from Firestore
const fetchUserDetails = async (email) => {
  try {
    const userRef = doc(db, 'users', email);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('User details:', userData);
      return userData;
    } else {
      console.log('No such user!');
    }
  } catch (error) {
    console.error('Error fetching user details:', error.message);
  }
};

// Adding IP address to user data (in case you need to track additional devices)
const addIPToUser = async (email, newIP) => {
  try {
    const userRef = doc(db, 'users', email);
    await updateDoc(userRef, {
      ip_addresses: arrayUnion(newIP), // Add the new IP address to the user's list
    });
    console.log('IP address added successfully');
  } catch (error) {
    console.error('Error adding IP address:', error.message);
  }
};

// Check if the user has valid permissions
const hasPermission = (userRole, command) => {
  const permissions = {
    user: ['login', 'signup', 'updatepassword', 'whoami', 'help', 'usetheapp'],
    moderator: ['login', 'signup', 'updatepassword', 'whoami', 'help', 'usetheapp', 'logs'],
    admin: ['login', 'signup', 'updatepassword', 'whoami', 'help', 'usetheapp', 'logs', 'changepassword', 'changerole', 'viewroles'],
  };

  return permissions[userRole] && permissions[userRole].includes(command);
};

export { signup, login, updateUser, fetchUserDetails, addIPToUser, updatePassword, changeRole, hasPermission };