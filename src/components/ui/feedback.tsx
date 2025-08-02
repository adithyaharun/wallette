import type { LucideProps } from "lucide-react";
import { cn } from "../../lib/utils";

type FeedbackProps = {
  title?: string;
  content?: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Feedback({ title, content, ...props }: FeedbackProps) {
  return (
    <div className={cn("flex flex-col py-12 md:py-20 text-muted-foreground items-center space-y-4", props.className)} {...props}>
      {props.icon && <props.icon className="size-16" />}
      <div className="space-y-1 w-full text-center">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {content && <p>{content}</p>}
      </div>
    </div>
  );
}
