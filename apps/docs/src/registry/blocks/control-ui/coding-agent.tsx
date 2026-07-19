"use client";

import { BotIcon, ChevronRightIcon, CircleIcon, FolderIcon, PlusIcon, SearchIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { ChatLayout, ChatThread } from "@/components/control-ui/chat-layout";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
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
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";

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

export type CodingAgentBlockProps = Omit<ComponentProps<"div">, "children"> & {
  appName?: string;
  brand?: ReactNode;
  sidebarTop?: ReactNode;
  navigation?: readonly CodingAgentNavigationItem[];
  projects: readonly CodingAgentProject[];
  activeTaskId?: string;
  activeTaskTitle?: string;
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
  activeTaskId,
  activeTaskTitle = "New task",
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
  const contained = layout === "contained";

  return (
    <SidebarProvider
      className={cn("overflow-hidden bg-background text-foreground", contained ? "relative h-full min-h-0" : "h-svh min-h-svh", className)}
      style={{ "--sidebar-width": "17.5rem", ...style } as CSSProperties}
      {...props}
    >
      <CodingAgentSidebar
        appName={appName}
        brand={brand}
        sidebarTop={sidebarTop}
        navigation={navigation}
        projects={projects}
        activeTaskId={activeTaskId}
        contained={contained}
        sidebarFooter={sidebarFooter}
        onNavigationSelect={onNavigationSelect}
        onTaskSelect={onTaskSelect}
        onNewTask={onNewTask}
        onSearch={onSearch}
      />
      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/70 px-3">
          <SidebarTrigger size="xs" className="md:hidden" />
          <FolderIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h1 className="min-w-0 flex-1 truncate text-label font-medium">{activeTaskTitle}</h1>
          {headerActions ? <div className="flex shrink-0 items-center gap-1">{headerActions}</div> : null}
        </header>
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
  activeTaskId,
  contained,
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
  activeTaskId?: string;
  contained: boolean;
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
    <Sidebar collapsible="offcanvas" className={contained ? "absolute! inset-y-0! h-full border-r border-sidebar-border" : undefined}>
      <SidebarHeader className="gap-1.5 border-b border-sidebar-border px-2 pb-2 pt-3">
        {sidebarTop}
        <div className="flex min-w-0 items-center gap-2 px-1 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {brand ?? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <BotIcon className="size-3.5" aria-hidden="true" />
              </span>
            )}
            <span className="truncate text-label font-semibold">{appName}</span>
          </div>
          <Button variant="ghost" size="sm" iconOnly aria-label="Search tasks" onClick={onSearch}>
            <SearchIcon className="size-3.5" />
          </Button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" onClick={startTask}>
              <PlusIcon />
              <span>New task</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.length > 0 ? (
          <SidebarGroup className="pb-0">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    size="sm"
                    onClick={() => {
                      onNavigationSelect?.(item);
                      finishMobileNavigation();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.trailing ? <span className="ml-auto shrink-0">{item.trailing}</span> : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : null}

        <SidebarGroup className="gap-1 pt-1">
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <div className="grid gap-1">
            {projects.map((project) => (
              <Collapsible key={project.id} defaultOpen={project.open ?? true} className="min-w-0">
                <CollapsibleTrigger className="flex h-[var(--control-h-sm)] w-full items-center gap-2 rounded-[var(--radius-popup-item)] px-2 text-caption font-medium hover:bg-foreground/6">
                  <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="flex shrink-0 items-center text-muted-foreground">
                    {project.icon ?? <FolderIcon className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="truncate">{project.name}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="mt-1 pl-5">
                    {project.tasks.map((task) => {
                      const isActive = task.id === activeTaskId;
                      return (
                        <SidebarMenuItem key={task.id}>
                          <SidebarMenuButton
                            size="sm"
                            isActive={isActive}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => {
                              onTaskSelect?.(task, project);
                              finishMobileNavigation();
                            }}
                          >
                            <CircleIcon className="size-1.5 fill-current opacity-35" aria-hidden="true" />
                            <span>{task.title}</span>
                            {task.trailing ? <span className="ml-auto shrink-0">{task.trailing}</span> : null}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {sidebarFooter ? <SidebarFooter className="border-t border-sidebar-border">{sidebarFooter}</SidebarFooter> : null}
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
    <ChatLayout className={cn("h-full min-h-0 max-w-none rounded-none border-0 bg-transparent shadow-none", className)} {...props}>
      <ChatThread className="px-0 py-8 sm:px-0">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-4 sm:px-8">{children}</div>
      </ChatThread>
      <div className="mx-auto w-full max-w-3xl px-2 sm:px-6">{composer}</div>
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

export type CodingAgentEmptyStateProps = Omit<ComponentProps<"section">, "title"> & {
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
    <section className={cn("my-auto flex w-full flex-col items-center py-10 text-center", className)} {...props}>
      <div className="mb-5 flex size-11 items-center justify-center rounded-2xl border bg-card text-muted-foreground shadow-sm">
        {icon ?? <BotIcon className="size-5" aria-hidden="true" />}
      </div>
      <h2 className="text-balance text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {suggestions.length > 0 ? (
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.id}
              variant="surface"
              size="lg"
              className="h-auto min-h-28 w-full items-start justify-start whitespace-normal rounded-[var(--radius-panel)] px-4 py-4 text-left"
              onClick={() => onSuggestionSelect?.(suggestion.prompt ?? suggestion.title, suggestion)}
            >
              <span className="flex min-w-0 flex-col items-start gap-3">
                <span className="text-primary-text">{suggestion.icon}</span>
                <span className="text-sm font-medium leading-5 text-foreground">{suggestion.title}</span>
                {suggestion.description ? (
                  <span className="text-caption leading-5 text-muted-foreground">{suggestion.description}</span>
                ) : null}
              </span>
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
