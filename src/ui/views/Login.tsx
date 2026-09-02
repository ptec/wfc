import { useContext } from "react";
import { AppContext } from "../../App";
import { useGoogleLogin } from "@react-oauth/google";

import Card from "../components/Card";
import Page from "../components/Page";

export default function Login() {
  const { accessToken, setAccessToken } = useContext(AppContext);

  const loginWithGoogle = useGoogleLogin({
    onSuccess({access_token}) {
      setAccessToken(access_token);
    }
  });

  return (
    <Page className="justify-center items-center">
      <Card className="w-sm gap-2">
        <span className="text-3xl font-bold text-center">PTEC WFC Dashboard</span>
        <span className="italic text-center">Use your school provided Google account to login.</span>
        <button className="btn btn-primary" onClick={() => loginWithGoogle()}>
          Login with Google
        </button>
      </Card>
    </Page>
  )
}