import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import type React from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

type ConfirmButtonProps = {
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  description?: string;
  okLabel?: string;
  cancelLabel?: string;
  okProps?: React.ComponentProps<typeof Button>;
  cancelProps?: React.ComponentProps<typeof Button>;
  children: React.ReactNode;
};

export function ConfirmButton(props: ConfirmButtonProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{props.children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{props.title}</DrawerTitle>
            {props.description && (
              <DrawerDescription>{props.description}</DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={props.onOk} {...props.okProps}>
              {props.okLabel || "OK"}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={props.onCancel}
                {...props.cancelProps}
              >
                {props.cancelLabel || "Cancel"}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          {props.description && (
            <AlertDialogDescription>{props.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={props.onOk} {...props.okProps}>
            {props.okLabel || "OK"}
          </Button>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={props.onCancel}
              {...props.cancelProps}
            >
              {props.cancelLabel || "Cancel"}
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
