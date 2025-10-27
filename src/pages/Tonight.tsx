import Layout from "@/components/Layout";
import { Calendar } from "lucide-react";

const Tonight = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background px-6 pt-6">
        <h1 className="text-3xl font-black text-foreground mb-6">TONIGHT MODE</h1>
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Tonight Mode</h2>
          <p className="text-muted-foreground">
            Find spontaneous connections for tonight
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Tonight;
