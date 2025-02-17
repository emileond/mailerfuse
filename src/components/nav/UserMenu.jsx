import {
    Avatar,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    User,
} from '@heroui/react';
import {
    RiSunLine,
    RiMoonClearLine,
    RiExpandUpDownLine,
    RiLogoutBoxRLine,
    RiQuestionLine,
    RiMegaphoneLine,
    RiUserLine,
    RiInbox2Line,
} from 'react-icons/ri';
import { useDarkMode } from '../../hooks/theme/useDarkMode';
import { useUser } from '../../hooks/react-query/user/useUser';
import { useLogout } from '../../hooks/react-query/user/useUser';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '../../hooks/react-query/user/useUserProfile.js';
import { useCallback } from 'react';

function UserMenu({ avatarOnly }) {
    const queryClient = useQueryClient();
    const [darkMode, setDarkMode] = useDarkMode();
    const { data: user } = useUser();
    const { data: userProfile, isPending: isUserProfilePending } = useUserProfile(user);
    const { mutateAsync: logoutUser } = useLogout();

    const USER_ICON_SIZE = 20;
    const ICON_SIZE = 22;

    // Memoized logout function
    const handleLogout = useCallback(async () => {
        await logoutUser();
        await queryClient.invalidateQueries(); // No need to cancel queries before invalidating
    }, [logoutUser, queryClient]);

    // Fallback avatar URL
    const avatarUrl = userProfile?.avatar;

    if (!user || isUserProfilePending) return null; // Prevents unnecessary rendering

    return (
        <Dropdown>
            <DropdownTrigger>
                {avatarOnly ? (
                    <Avatar
                        showFallback
                        name={user?.data?.name || 'User'}
                        src={avatarUrl}
                        size="sm"
                        className="cursor-pointer"
                    />
                ) : (
                    <User
                        as={Button}
                        variant="bordered"
                        size="lg"
                        className="justify-between px-3 border"
                        endContent={<RiExpandUpDownLine fontSize={ICON_SIZE - 6} />}
                        name={user?.data?.name || 'User'}
                        description={user?.email || 'email'}
                        avatarProps={{
                            size: 'sm',
                            src: avatarUrl,
                        }}
                    />
                )}
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownSection showDivider>
                    <DropdownItem textValue="user">
                        <User
                            name={user?.data?.name || 'User'}
                            description={user?.email || 'email'}
                            avatarProps={{
                                className: 'hidden',
                                src: avatarUrl,
                            }}
                        />
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                    <DropdownItem startContent={<RiMegaphoneLine fontSize={USER_ICON_SIZE} />}>
                        {`What's new`}
                    </DropdownItem>
                    <DropdownItem startContent={<RiQuestionLine fontSize={USER_ICON_SIZE} />}>
                        Help
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                    <DropdownItem
                        onPress={() => setDarkMode(!darkMode)}
                        startContent={
                            darkMode ? (
                                <RiSunLine fontSize={USER_ICON_SIZE} />
                            ) : (
                                <RiMoonClearLine fontSize={USER_ICON_SIZE} />
                            )
                        }
                    >
                        {darkMode ? 'Light' : 'Dark'} theme
                    </DropdownItem>
                    {[
                        {
                            name: 'Profile',
                            path: '/account/profile',
                            startContent: <RiUserLine fontSize={USER_ICON_SIZE} />,
                        },
                        {
                            name: 'Invitations',
                            path: '/account/invitations',
                            startContent: <RiInbox2Line fontSize={USER_ICON_SIZE} />,
                        },
                        {
                            name: 'Log Out',
                            action: handleLogout,
                            startContent: <RiLogoutBoxRLine fontSize={USER_ICON_SIZE} />,
                        },
                    ].map((route, index) => (
                        <DropdownItem
                            as={route.path ? Link : 'button'}
                            key={index}
                            to={route.path}
                            onPress={route.action}
                            startContent={route?.startContent}
                            className="items-center justify-start"
                        >
                            {route.name}
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}

export default UserMenu;
