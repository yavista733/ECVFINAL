import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  CreatePost: undefined;
  PostDetail: { postId: number };
  Chat: { conversationId: number; title: string };
  Settings: undefined;
  Search: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type CreatePostScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePost'>;
export type PostDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
