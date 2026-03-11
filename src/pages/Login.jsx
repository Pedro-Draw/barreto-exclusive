// Login.jsx
import React from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../App.jsx"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

function Login() {
  const navigate = useNavigate()
  const { loginUser, loginGoogle, user } = useApp()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [shake, setShake] = React.useState(false)

  // ======================
  // BACKGROUND MOTION
  // ======================
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  function handleMouseMove(e) {
    mouseX.set(e.clientX - window.innerWidth / 2)
    mouseY.set(e.clientY - window.innerHeight / 2)
  }

  // ======================
  // REDIRECT SE JA LOGADO
  // ======================
  React.useEffect(() => {
    if (user) navigate("/dashboard")
  }, [user])

  // ======================
  // VALIDAÇÃO
  // ======================
  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // ======================
  // LOGIN EMAIL
  // ======================
  async function handleLogin(e) {
    e.preventDefault()
    setError("")

    if (!validateEmail(email) || password.length < 4) {
      setError("Preencha os campos corretamente.")
      triggerShake()
      return
    }

    try {
      setLoading(true)
      await loginUser(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError("Email ou senha inválidos.")
      triggerShake()
    }
    setLoading(false)
  }

  // ======================
  // LOGIN GOOGLE
  // ======================
  async function handleGoogle() {
    try {
      setLoading(true)
      await loginGoogle()
      navigate("/dashboard")
    } catch (err) {
      setError("Erro ao autenticar com Google.")
      triggerShake()
    }
    setLoading(false)
  }

  // ======================
  // RENDER
  // ======================
  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center bg-black px-4 overflow-hidden"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle at center, rgba(99,102,241,0.35), transparent 70%)",
        }}
      />

      {/* CARD */}
      <motion.div
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-3xl p-10 shadow-2xl z-10 flex flex-col items-center"
      >
        {/* LOGO */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-white tracking-wide">Havk</h1>
          <p className="text-zinc-400 mt-2 text-lg">Bem-vindo de volta</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg p-3 text-center animate-pulse">
              {error}
            </div>
          )}

          {/* BUTTON LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition text-white py-4 rounded-xl font-semibold text-lg"
          >
            <LogIn size={20} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-6 w-full">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-3 text-zinc-500 text-sm uppercase tracking-wide">ou</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 transition text-white py-4 rounded-xl font-medium text-lg"
        >
          <FcGoogle size={24} />
          Entrar com Google
        </button>

        {/* REGISTER LINK */}
        <div className="mt-8 text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Criar conta
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Login