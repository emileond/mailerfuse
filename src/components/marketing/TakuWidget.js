import { useEffect } from 'react';

const TakuWidget = () => {
    useEffect(() => {
        if (!document.getElementById('taku-js')) {
            const script = document.createElement('script');
            script.id = 'taku-js';
            script.src = 'https://cdn.taku-app.com/js/latest.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                if (window.Taku) {
                    window.Taku('news:boot', {
                        api_public_key: '793006e41483478031c58f9c6440e525',
                        position: 'right',
                        custom_launcher: '.taku-launcher',
                        custom_launcher_options: {
                            show_unread_badge: true,
                        },
                    });
                }
            };
        }
    }, []);

    return null; // No UI, just loading the script
};

export default TakuWidget;
