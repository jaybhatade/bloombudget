import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import app from "../../../Firebase";

const db = getFirestore(app);

// Check if user is already authenticated
export const checkAuthentication = async () => {
    const userID = localStorage.getItem("userID");
    
    if (!userID) {
        return null;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error checking authentication:', error);
        throw error;
    }
};

// Handle user login
export const loginUser = async (email, password) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const user = querySnapshot.docs[0].data();
            const userId = querySnapshot.docs[0].id;
            
            if (user.password === password) {
                localStorage.setItem("userID", userId);
                return {
                    success: true,
                    userId,
                    role: user.role
                };
            } else {
                return {
                    success: false,
                    error: "Invalid password!"
                };
            }
        } else {
            return {
                success: false,
                error: "User not found!"
            };
        }
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: "Error logging in: " + error.message
        };
    }
};

// Handle user registration
export const registerUser = async (name, email, password) => {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            name,
            email,
            password,
            role: 'User'
        });
        
        return {
            success: true,
            userId: docRef.id
        };
    } catch (err) {
        console.error("Registration error:", err);
        return {
            success: false,
            error: 'Error adding user: ' + err.message
        };
    }
};