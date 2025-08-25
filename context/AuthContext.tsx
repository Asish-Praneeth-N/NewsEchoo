// context/AuthContext.tsx (unchanged)

'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // Refresh user data (e.g., emailVerified)
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userRole = userDoc.exists() ? userDoc.data().role : null;
        
        if (!userDoc.exists()) {
          // Create the document if it doesn't exist, regardless of verification status
          await setDoc(userDocRef, {
            email: user.email,
            role: "user",
            createdAt: Timestamp.fromDate(new Date()),
          });
          userRole = "user";
        }
        
        if (user.emailVerified) {
          // Only set role in context if verified
          setRole(userRole);
          setUser(user);
        } else {
          setRole(null);
          setUser(null);
          await auth.signOut(); // Sign out unverified users after document creation
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, role, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);