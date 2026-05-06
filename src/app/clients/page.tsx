"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Pencil,
  Search,
  Trash2,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import NavBar from "../components/Navbar";
import useUser from "../utils/useUser";
import {useState } from "react"
import Loader from "../components/Loader";

export default function ClientsPage() {
  const [loading , setLoading] = useState(false)
  const user = useUser();

  
  const stats = [
    {
      label: "Clientes",
      value: 128,
      icon: UsersRound,
      accent: "from-sky-400/25 to-cyan-400/10 text-cyan-100",
    },
    {
      label: "Ativos",
      value: 110,
      icon: UserCog,
      accent: "from-emerald-400/24 to-lime-400/10 text-emerald-100",
    },
    {
      label: "Inativos",
      value: 18,
      icon: BriefcaseBusiness,
      accent: "from-amber-400/24 to-orange-400/10 text-amber-100",
    },
  ];

  const clients = [
    {
      id: "1",
      name: "Empresa Alpha",
      email: "contato@alpha.com",
      status: "ativo",
      createdAt: "01/01/2026",
    },
  ];

  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} />

        <motion.main
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8"
        >
          {/* HEADER */}
          <section className="overflow-hidden rounded-[36px] border border-white/10 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Gestão de clientes
                </div>

                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    Gerencie os clientes cadastrados
                  </h1>
                  <p className="text-sm text-slate-300">
                    Consulte, edite ou remova clientes do sistema.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map(({ label, value, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className={`rounded-[28px] border border-white/10 p-5 ${accent}`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-slate-300">{label}</p>
                        <p className="text-2xl text-white">{value}</p>
                      </div>
                      <Icon />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEARCH */}
          <section className="mt-8">
            <div className="flex items-center gap-3 rounded-[28px] border border-white/10 p-4">
              <Search className="text-white" />

              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full bg-transparent outline-none text-white"
              />

              <button className="text-white">
                <X />
              </button>
            </div>
          </section>

          {/* TABLE */}
          <section className="mt-8 rounded-[30px] border border-white/10 overflow-hidden">
            <div className="grid grid-cols-5 p-4 text-xs text-slate-400 border-b">
              <span>Cliente</span>
              <span>Email</span>
              <span>Status</span>
              <span>Cadastro</span>
              <span className="text-right">Ações</span>
            </div>

            <div>
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-5 p-4 border-b text-white"
                >
                  <span>{client.name}</span>
                  <span>{client.email}</span>
                  <span>{client.status}</span>
                  <span>{client.createdAt}</span>

                  <div className="flex justify-end gap-2">
                    <button className="border p-2 rounded">
                      <Pencil />
                    </button>

                    <button className="border p-2 rounded">
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.main>
      </div>
    </>
  );
}