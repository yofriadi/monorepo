import { AccountSettings } from '@stackframe/stack';
import { ProfileSetting } from './components/profile-setting';

export default function MyAccountPage() {
  return (
    <AccountSettings
      fullPage={true}
      extraItems={[{
        title: 'Profile Settings',
        iconName: "User",
        content: <ProfileSetting />,
        id: 'profile',
      }]}
    />
  );
}
