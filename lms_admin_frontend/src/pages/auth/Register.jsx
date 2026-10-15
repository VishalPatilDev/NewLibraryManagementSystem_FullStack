import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Card from "../../components/comman/Card";
import Input from "../../components/comman/Input";

const Register = () => {
    const navigate = useNavigate();

    const { register, authError } = useApi();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        dateOfBirth: "",
        phone: "",
        address: "",
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

        const success = await register(formData);

        setLoading(false);

        if (success) {
            navigate("/login");
        }
    };

    return (
        <Card>
            <div>
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
                    Create Account
                </h1>

                {authError && (
                    <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                        Registration failed.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <Input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />


                    <Input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    <Input
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    <textarea
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>
            </div>
        </Card>

    );
};

export default Register;
