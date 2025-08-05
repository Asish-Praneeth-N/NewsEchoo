'use client';

import { useState, useEffect } from "react";
import { Users, Calendar, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Newsletter {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  author: string;
  subscriberCount: number;
  publishedAt: string;
  isSubscribed: boolean;
  subscribedAt?: Date;
}

function NewsletterCard({ newsletter }: { newsletter: Newsletter }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }
    setIsSubmitting(true);
    try {
      const subscriptionRef = doc(
        db,
        "users",
        user.uid,
        "subscriptions",
        newsletter.id
      );
      if (newsletter.isSubscribed) {
        if (
          !newsletter.subscribedAt ||
          (Date.now() - newsletter.subscribedAt.getTime()) /
            (1000 * 60 * 60 * 24) <= 1
        ) {
          toast.error("You cannot unsubscribe for 24 hours after subscribing.");
          setIsSubmitting(false);
          return;
        }
        await deleteDoc(subscriptionRef);
        toast.success("Successfully unsubscribed!");
        newsletter.isSubscribed = false;
      } else {
        await setDoc(subscriptionRef, { subscribedAt: new Date() });
        toast.success("Successfully subscribed!");
        newsletter.isSubscribed = true;
        router.push(
          `/user-dashboard/subscriptions?newsletterId=${newsletter.id}`
        );
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      console.error("Subscription error:", error);
      toast.error("Failed to update subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = () => {
    if (newsletter.isSubscribed) {
      router.push(
        `/user-dashboard/subscriptions?newsletterId=${newsletter.id}`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onClick={handleCardClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        newsletter.isSubscribed ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="aspect-video w-full">
        {newsletter.imageUrl ? (
          <img
            src={newsletter.imageUrl}
            alt={newsletter.title}
            className="w-full h-full object-cover"
            onError={() =>
              toast.error(`Failed to load image for ${newsletter.title}`)
            }
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              No image available
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
            {newsletter.category}
          </span>
          {newsletter.isSubscribed && (
            <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
              Subscribed
            </span>
          )}
        </div>
        <h3 className="text-lg font-playfair font-bold text-slate-900 dark:text-slate-100 mb-2">
          {newsletter.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
          {newsletter.description}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>
              {newsletter.subscriberCount.toLocaleString()} subscribers
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(newsletter.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            by {newsletter.author}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe();
              }}
              disabled={isSubmitting || !user}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                newsletter.isSubscribed
                  ? "bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                  : "bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting
                ? "..."
                : newsletter.isSubscribed
                ? "Unsubscribe"
                : "Subscribe"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NewslettersPage() {
  const { user, loading: authLoading } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.role === "admin");
          console.log(`User ${user.uid} admin status: ${data.role === "admin"}`);
        } else {
          console.warn(`User document for ${user.uid} does not exist`);
          setIsAdmin(false);
        }
      } catch (err: unknown) {
        console.error("Check admin status error:", err);
        setIsAdmin(false);
      }
    };

    const fetchNewsletters = async () => {
      setIsLoading(true);
      try {
        const newslettersQuery = query(
          collection(db, "newsletters"),
          where("status", "==", "published")
        );
        const newslettersSnap = await getDocs(newslettersQuery);
        console.log(`Found ${newslettersSnap.docs.length} published newsletters`);

        const newslettersData: Newsletter[] = await Promise.all(
          newslettersSnap.docs.map(async (doc) => {
            let subscriberCount = 0;
            if (isAdmin) {
              try {
                const subscriptionsQuery = query(
                  collection(db, "users"),
                  where(`subscriptions.${doc.id}`, "!=", null)
                );
                const subscriptionsSnap = await getDocs(subscriptionsQuery);
                subscriberCount = subscriptionsSnap.size;
              } catch (err: unknown) {
                console.error(`Error fetching subscriber count for newsletter ${doc.id}:`, err);
              }
            }
            return {
              id: doc.id,
              title: doc.data().title || "Untitled",
              description: doc.data().description || "",
              imageUrl: doc.data().imageUrl || null,
              category: doc.data().category || "General",
              author: doc.data().author || "Unknown",
              subscriberCount,
              publishedAt:
                (doc.data().publishedAt || doc.data().date)?.toDate().toISOString() ||
                new Date().toISOString(),
              isSubscribed: false,
              subscribedAt: undefined,
            } as Newsletter;
          })
        );

        if (user) {
          const subscriptionsQuery = query(
            collection(db, "users", user.uid, "subscriptions")
          );
          const subscriptionsSnap = await getDocs(subscriptionsQuery);
          console.log(`Found ${subscriptionsSnap.docs.length} subscriptions for user ${user.uid}`);
          subscriptionsSnap.forEach((subDoc) => {
            const newsletter = newslettersData.find((n) => n.id === subDoc.id);
            if (newsletter) {
              newsletter.isSubscribed = true;
              newsletter.subscribedAt =
                subDoc.data().subscribedAt?.toDate() || new Date();
            }
          });
        }

        setNewsletters(newslettersData);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        console.error("Fetch newsletters error:", error);
        toast.error("Failed to load newsletters");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
      fetchNewsletters();
    }
  }, [user, authLoading, isAdmin]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <style jsx>{`
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">
            Newsletters
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Browse and subscribe to newsletters
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl">
            {newsletters.length} Newsletter{newsletters.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {newsletters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((newsletter) => (
            <NewsletterCard key={newsletter.id} newsletter={newsletter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-playfair font-medium text-slate-900 dark:text-slate-100 mb-2">
            No newsletters available
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            There are no published newsletters at the moment.
          </p>
          <Link
            href="/user-dashboard"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}