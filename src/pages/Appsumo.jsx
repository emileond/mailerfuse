import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ky from 'ky';
import NavBar from '../components/marketing/Nav.jsx';
import Footer from '../components/marketing/Footer.jsx';
import { useUser } from '../hooks/react-query/user/useUser.js';
import AuthForm from '../components/auth/AuthForm.jsx';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Link } from '@heroui/react';

function AppsumoPage() {
    const { data: user } = useUser();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetchLicense() {
        if (!code) return;

        setLoading(true);
        setError(null);

        try {
            const response = await ky
                .post('/api/appsumo/get-user-license', {
                    json: { code },
                    throwHttpErrors: false, // Prevent ky from throwing on non-2xx responses
                })
                .json();

            console.log('Response:', response);

            if (response.license) {
                setLicense(response.license);
            } else {
                setError(
                    response.error_description || response.error || 'Failed to retrieve license',
                );
                console.error('License fetch error:', response);
            }
        } catch (err) {
            console.error('Request failed:', err);
            setError(err.message || 'An error occurred while fetching the license.');
        } finally {
            setLoading(false);
        }
    }

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
                            <div className="flex flex-col gap-6 items-center max-w-2xl">
                                {!error && (
                                    <Alert
                                        color="primary"
                                        title={`You're about to activate the LTD plan on: ${user?.email}`}
                                        description={`If this is not the account you want to use, please log out to use a different account.`}
                                    />
                                )}
                                {error && (
                                    <Alert color="danger" title="Error" description={error} />
                                )}
                                {license && (
                                    <Alert
                                        color="success"
                                        title="LTD Plan Activated!"
                                        description={`Your license key: ${license.license_key}`}
                                    />
                                )}
                                <CardFooter>
                                    <div className="w-full flex flex-col items-center gap-3">
                                        <Button
                                            color="secondary"
                                            size="lg"
                                            isLoading={loading}
                                            onPress={fetchLicense}
                                        >
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
