'use client';
import { Header } from "../components/header";
import { login } from './actions'

export default function Login() {
    return (
        <div className="flex justify-center items-center mt-25 font-(family-name:--font-pacifico) min-h-[calc(100vh-100px)] bg-linear-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />
            <form>
                <div className="bg-white text-black">
                    <label htmlFor="email">Email:</label>
                    <input id="email" name="email" type="email" required />
                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" required />
                    <button formAction={login}>Log in</button>
                </div>
            </form>
        </div>
    )
}