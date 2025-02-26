import { useLocation } from 'react-router-dom'; // Import the useLocation hook
import NavBar from '../components/marketing/Nav.jsx';
import Footer from '../components/marketing/Footer.jsx';
import { useUser } from '../hooks/react-query/user/useUser.js';
import AuthForm from '../components/auth/AuthForm.jsx';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Link } from '@heroui/react';

function AppsumoPage() {
    const { data: user } = useUser(); // User info from the hook
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code'); // Get the code from the URL query params

    return (
        <div className="w-screen">
            <NavBar />
            <div className="p-20 min-h-[70vh] items-center flex flex-col gap-3">
                <Card shadow="sm" className="p-4">
                    <CardHeader className="flex flex-col gap-3">
                        <h1 className="font-bold">Welcome Sumo-ling!</h1>
                        <p>You're one step away from activating your LTD plan.</p>
                    </CardHeader>
                    <CardBody>
                        {!user ? (
                            <div className="flex flex-col gap-3 max-w-2xl">
                                <Alert
                                    title="Login to Activate Your LTD Plan"
                                    description="To redeem your LTD plan, please log in with your existing account, or create one if you don't have one yet."
                                />
                                <AuthForm hideHeader viewMode="login" />

                                <p className="mt-4 text-center">
                                    Don’t have an account?{' '}
                                    <Link
                                        href="https://mailerfuse.com/signup"
                                        isExternal
                                        className="text-primary font-semibold"
                                    >
                                        Create one here
                                    </Link>
                                    .
                                </p>
                            </div>
                        ) : (
                            // If the user is logged in
                            <div className="flex flex-col gap-6 items-center max-w-2xl">
                                <Alert
                                    color="primary"
                                    title={`You're about to activate the LTD plan on: ${user?.email}`}
                                    description={`If this is not the account you want to use, please log out to use a different account.`}
                                />
                                <CardFooter>
                                    <div className="w-full flex flex-col items-center gap-3">
                                        <Button color="secondary" size="lg">
                                            Confirm and Activate LTD Plan
                                        </Button>
                                        <span className="text-gray-500">OR</span>
                                        <Button
                                            variant="bordered"
                                            size="lg"
                                            onPress={() => {
                                                /* Add logout functionality here */
                                            }}
                                        >
                                            Log out
                                        </Button>
                                    </div>
                                </CardFooter>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
            <Footer />
        </div>
    );
}

export default AppsumoPage;
