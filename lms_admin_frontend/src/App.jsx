import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories"
import Profile from "./pages/Profile";
import Books from "./pages/Books"
import Authoors from "./pages/Authors"
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Authors from "./pages/Authors";
import Users from "./pages/Users";
import Racks from "./pages/Racks";
import AcademicYear from "./pages/AcademicYear";
import Editions from "./pages/Editions";
import Loans from "./pages/Loans"
import Fines from "./pages/Fines";
// import Settings from "./pages/Settings";
import Reservations from "./pages/Reservations"
import Publishers from "./pages/Publishers"
import Members from "./pages/Members";
import RackExplorer from "./pages/RacksExplorer";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/settings" element={<Settings></Settings>} /> */}

        {/* Protected Staff Application */}
        <Route element={<ProtectedRoute />}>

          <Route element={<AdminLayout />}>



            <Route
              path="/profile"
              element={<Profile />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard></Dashboard>}
            />
            <Route
              path="/categories"
              element={<Categories></Categories>}
            />
            <Route
              path="/books"
              element={<Books></Books>}
            />
            <Route
              path="/authors"
              element={<Authors></Authors>}
            />
            <Route
              path="/users"
              element={<Users></Users>}
            />
            <Route
              path="/racks"
              element={<Racks></Racks>}
            />
            <Route
              path="/academicYear"
              element={<AcademicYear></AcademicYear>}
            />
            <Route
              path="/editions"
              element={<Editions></Editions>}
            />
            <Route
              path="/loans"
              element={<Loans></Loans>}
            />
            <Route
              path="/fines"
              element={<Fines></Fines>}
            />
            <Route
              path="/reservations"
              element={<Reservations></Reservations>}
            />

            <Route
              path="/publishers"
              element={<Publishers></Publishers>}
            />
            <Route
              path="/members"
              element={<Members></Members>}
            />
            <Route
              path="/racksExplorer"
              element={<RackExplorer></RackExplorer>}
            />



          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
