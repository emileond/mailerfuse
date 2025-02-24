import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';

function IntegrationsPage() {
    return (
        <AppLayout>
            <PageLayout title="Integrations" maxW="3xl">
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeMGYTjwYJrB9C4K4BPdLGIvrc6s-6LSaWCZmTICIukyE8o5g/viewform?embedded=true"
                    width="640"
                    height="1080"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                >
                    Loading…
                </iframe>
            </PageLayout>
        </AppLayout>
    );
}

export default IntegrationsPage;
