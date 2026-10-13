import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Página não encontrada — Lucas Evangelista</title>
      </Helmet>
      <Navbar />
      <section className="flex-1 min-h-[75vh] pt-24 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-display text-[110px] md:text-[160px] font-bold text-primary/20 leading-none select-none">
          404
        </span>
        <h1 className="font-display text-2xl md:text-4xl font-medium text-foreground mt-4 mb-3">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground max-w-md mb-8 text-[15px] leading-relaxed">
          O endereço que você tentou acessar não existe ou foi alterado. Utilize o menu superior ou volte para a página inicial.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar para o Início
          </Link>
          <Link to="/projetos" className="btn-ghost inline-flex">
            Ver Portfólio
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NotFound;
