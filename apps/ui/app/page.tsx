
import Header from "@/components/Header";
import FormComponent from "../components/AirdropForm";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="border-2 rounded-xl border-blue-100 md:max-w-3xl container mx-auto mt-10 min-h-[500px] p-3 ring-2 ring-blue-300">
        <h2 className='text-xl font-bold'>T-Sender</h2>
        <FormComponent />
      </div>
    </div>
  );
}
