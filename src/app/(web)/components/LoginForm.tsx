// "use client";

// import { useState } from "react";

// interface LoginFormProps { onLogin?: () => void; }

// export default function LoginForm({ onLogin }: LoginFormProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handle = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (onLogin) onLogin();
//   };

//   return (
//     <form onSubmit={handle} className="space-y-4">
//       {/* …same inputs & button from above… */}
//     </form>
//   );
// }
