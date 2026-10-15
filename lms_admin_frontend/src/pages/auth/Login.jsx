import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Card from "../../components/comman/Card";

const Login = () => {
    const navigate = useNavigate();

    const { login, authError } = useApi();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        const success = await login(formData);

        setLoading(false);

        if (success) {
            navigate("/profile");
        }
    };

    return (
        <Card>
            <div>
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
                    Login
                </h1>

                {authError && (
                    <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                        Invalid email or password.

                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
            <div>
                <span className="mt-2 font-light text-sm flex justify-center">New User? Contact Admin/Librarian to create Account</span>
                <span>admin@library.com                 Admin@123</span>
            </div>
        </Card>

    );
};

export default Login;
