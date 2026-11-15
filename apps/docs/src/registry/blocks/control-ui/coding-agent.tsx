"use client";

import { BotIcon, ChevronRightIcon, FolderIcon, PlusIcon, SearchIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { ChatLayout, ChatThread, ChatThreadScrollButton } from "@/components/control-ui/chat-layout";
import { cn } from "@/components/control-ui/lib/cn";
import { AppShellHeader } from "@/components/control-ui/ui/app-shell";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { Button } from "@/components/control-ui/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/control-ui/ui/item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, Text } from "@/components/control-ui/ui/typography";

export type CodingAgentNavigationItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export type CodingAgentTask = {
  id: string;
  title: string;
  trailing?: ReactNode;
};

export type CodingAgentProject = {
  id: string;
  name: string;
  icon?: ReactNode;
  tasks: readonly CodingAgentTask[];
  open?: boolean;
};

export type CodingAgentBlockProps = Omit<ComponentProps<"div">, "children"> &
  Pick<SidebarProviderProps, "persistOpen" | "keyboardShortcut"> & {
    appName?: string;
    brand?: ReactNode;
    sidebarTop?: ReactNode;
    navigation?: readonly CodingAgentNavigationItem[];
    projects: readonly CodingAgentProject[];
    activeNavigationId?: string;
    activeTaskId?: string;
    activeTaskTitle?: string;
    searchLabel?: string;
    newTaskLabel?: string;
    projectsLabel?: string;
    emptyProjectsLabel?: string;
    onNavigationSelect?: (item: CodingAgentNavigationItem) => void;
    onTaskSelect?: (task: CodingAgentTask, project: CodingAgentProject) => void;
    onNewTask?: () => void;
    onSearch?: () => void;
    headerActions?: ReactNode;
    sidebarFooter?: ReactNode;
    children: ReactNode;
    layout?: "viewport" | "contained";
  };

export function CodingAgentBlock({
  appName = "Agent",
  brand,
  sidebarTop,
  navigation = [],
  projects,
  activeNavigationId,
  activeTaskId,
  activeTaskTitle = "New task",
  searchLabel = "Search tasks",
  newTaskLabel = "New task",
  projectsLabel = "Projects",
  emptyProjectsLabel = "No projects yet",
  onNavigationSelect,
  onTaskSelect,
  onNewTask,
  onSearch,
  headerActions,
  sidebarFooter,
  children,
  layout = "viewport",
  className,
  style,
  ...props
}: CodingAgentBlockProps) {
  return (
    <SidebarProvider
      layout={layout}
      surface="background"
      defaultWidth={280}
      className={cn(layout === "viewport" && "h-svh overflow-hidden", className)}
      style={style}
      {...props}
    >
      <CodingAgentSidebar
        appName={appName}
        brand={brand}
        sidebarTop={sidebarTop}
        navigation={navigation}
        projects={projects}
        activeNavigationId={activeNavigationId}
        activeTaskId={activeTaskId}
        searchLabel={searchLabel}
        newTaskLabel={newTaskLabel}
        projectsLabel={projectsLabel}
        emptyProjectsLabel={emptyProjectsLabel}
        sidebarFooter={sidebarFooter}
        onNavigationSelect={onNavigationSelect}
        onTaskSelect={onTaskSelect}
        onNewTask={onNewTask}
        onSearch={onSearch}
      />
      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
        <AppShellHeader>
          <SidebarTrigger size="xs" className="sidebar:hidden" />
          <Heading
            level={layout === "contained" ? 2 : 1}
            size="label"
            weight="medium"
            className="min-w-0 flex-1 truncate"
            title={activeTaskTitle}
          >
            {activeTaskTitle}
          </Heading>
          {headerActions ? <div className="flex shrink-0 items-center gap-1">{headerActions}</div> : null}
        </AppShellHeader>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function CodingAgentSidebar({
  appName,
  brand,
  sidebarTop,
  navigation,
  projects,
  activeNavigationId,
  activeTaskId,
  searchLabel,
  newTaskLabel,
  projectsLabel,
  emptyProjectsLabel,
  sidebarFooter,
  onNavigationSelect,
  onTaskSelect,
  onNewTask,
  onSearch,
}: {
  appName: string;
  brand?: ReactNode;
  sidebarTop?: ReactNode;
  navigation: readonly CodingAgentNavigationItem[];
  projects: readonly CodingAgentProject[];
  activeNavigationId?: string;
  activeTaskId?: string;
  searchLabel: string;
  newTaskLabel: string;
  projectsLabel: string;
  emptyProjectsLabel: string;
  sidebarFooter?: ReactNode;
  onNavigationSelect?: (item: CodingAgentNavigationItem) => void;
  onTaskSelect?: (task: CodingAgentTask, project: CodingAgentProject) => void;
  onNewTask?: () => void;
  onSearch?: () => void;
}) {
  const { setOpenMobile } = useSidebar();

  function finishMobileNavigation() {
    setOpenMobile(false);
  }

  function startTask() {
    onNewTask?.();
    finishMobileNavigation();
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader divider className="gap-1.5">
        {sidebarTop}
        <div className="flex min-w-0 items-center gap-2 px-1 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {brand ?? (
              <Avatar size="xs" aria-hidden="true">
                <AvatarFallback>{appName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <Text size="label" weight="semibold" className="truncate" title={appName}>
              {appName}
            </Text>
          </div>
          {onSearch ? (
            <Button variant="ghost" size="sm" iconOnly aria-label={searchLabel} onClick={onSearch}>
              <SearchIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        {onNewTask ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" onClick={startTask}>
                <PlusIcon />
                <span>{newTaskLabel}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        {navigation.length > 0 ? (
          <SidebarGroup>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    size="sm"
                    isActive={item.id === activeNavigationId}
                    onClick={() => {
                      onNavigationSelect?.(item);
                      finishMobileNavigation();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.trailing ? <span className="ms-auto shrink-0">{item.trailing}</span> : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}

        <SidebarGroup className="gap-1">
          <SidebarGroupLabel>{projectsLabel}</SidebarGroupLabel>
          {projects.length === 0 ? (
            <Text size="caption" tone="muted" className="mx-2">
              {emptyProjectsLabel}
            </Text>
          ) : null}
          <div className="grid gap-1">
            {projects.map((project) => (
              <Collapsible key={project.id} defaultOpen={project.open ?? true} className="min-w-0">
                <CollapsibleTrigger>
                  <ChevronRightIcon aria-hidden="true" />
                  {project.icon ?? <FolderIcon aria-hidden="true" />}
                  <span className="truncate">{project.name}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {project.tasks.map((task) => (
                      <SidebarMenuItem key={task.id}>
                        <SidebarMenuButton
                          size="sm"
                          isActive={task.id === activeTaskId}
                          onClick={() => {
                            onTaskSelect?.(task, project);
                            finishMobileNavigation();
                          }}
                        >
                          <span>{task.title}</span>
                          {task.trailing ? <span className="ms-auto shrink-0">{task.trailing}</span> : null}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {sidebarFooter ? <SidebarFooter>{sidebarFooter}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  );
}

export type CodingAgentConversationProps = Omit<ComponentProps<typeof ChatLayout>, "children"> & {
  children: ReactNode;
  composer: ReactNode;
};

export function CodingAgentConversation({ children, composer, className, ...props }: CodingAgentConversationProps) {
  return (
    <ChatLayout chrome="embedded" className={className} {...props}>
      <ChatThread
        composer={
          <>
            <ChatThreadScrollButton />
            {composer}
          </>
        }
      >
        {children}
      </ChatThread>
    </ChatLayout>
  );
}

export type CodingAgentSuggestion = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  prompt?: string;
};

export type CodingAgentEmptyStateProps = Omit<ComponentProps<typeof Empty>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  suggestions?: readonly CodingAgentSuggestion[];
  onSuggestionSelect?: (prompt: string, suggestion: CodingAgentSuggestion) => void;
};

export function CodingAgentEmptyState({
  title = "What should we build?",
  description,
  icon,
  suggestions = [],
  onSuggestionSelect,
  className,
  ...props
}: CodingAgentEmptyStateProps) {
  return (
    <Empty className={cn("my-auto w-full", className)} {...props}>
      <EmptyHeader>
        <EmptyMedia>{icon ?? <BotIcon aria-hidden="true" />}</EmptyMedia>
        <EmptyTitle render={(titleProps) => <h2 {...titleProps} />}>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {suggestions.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((suggestion) => (
            <Item
              key={suggestion.id}
              variant="outline"
              render={<button type="button" onClick={() => onSuggestionSelect?.(suggestion.prompt ?? suggestion.title, suggestion)} />}
              className="min-h-28 w-full flex-col items-start text-start"
            >
              <ItemMedia>{suggestion.icon}</ItemMedia>
              <ItemContent>
                <ItemTitle>{suggestion.title}</ItemTitle>
                {suggestion.description ? <ItemDescription>{suggestion.description}</ItemDescription> : null}
              </ItemContent>
            </Item>
          ))}
        </div>
      ) : null}
    </Empty>
  );
}
