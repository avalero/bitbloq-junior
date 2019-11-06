import { IHeaderButton, HeaderButtonClickCallback } from "@bitbloq/ui";

export interface EditorProps {
  content: any;
  onContentChange: (content: any) => any;
  tabIndex: number;
  onTabChange: (index: number) => any;
  getTabs: (mainTabs: any) => any;
  title: string;
  canEditTitle?: boolean;
  onEditTitle?: () => any;
  onSaveDocument?: () => any;
  brandColor: string;
  headerButtons?: IHeaderButton[];
  onHeaderButtonClick?: HeaderButtonClickCallback;
  isPlayground?: boolean;
  headerRightContent?: JSX.Element;
  preMenuContent?: JSX.Element;
  changeAdvancedMode?(mode: boolean): void;
  documentAdvancedMode?: boolean;
  backCallback?():void;
}

export interface Document {
  title: string;
  description: string;
  image: string;
}
