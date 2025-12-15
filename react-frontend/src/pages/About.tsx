import { Link } from "react-router-dom";
import Card from "@/components/atoms/Card.tsx";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About ListBin.app
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              Hey! My name is Oliver! 👋🏼 <br/><br/>
              I built listbin.app to help me get the rules of my next pairing during 40k tournaments. I hope it helps you too! <br/>  <br/>
              I'm getting data from 39k.pro (with consent from the creator), and running an update once a week on Monday night to keep up with any changes.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-3 mt-6">Support</h2>
            <p className="text-gray-700 mb-4">
              If you find this tool useful and would like to support its development, consider buying me a coffee! It will always be free and ad-free!<br/><br/>
              Thank you!
            </p>

            <a
              href="https://buymeacoffee.com/listbin"
              target="_blank"
              rel="noopener noreferrer"
              style={{width:300}}
              className="flex bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors items-center gap-8"
            >
              <img
                className="coffeeImage"
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt="Buy me a coffee"
              />
              Buy Me a Coffee
            </a>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link to="/" className="text-blue-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
