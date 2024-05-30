import React from 'react';
import { cn } from '@/lib/utils';

type TypographyProps = {
  variant:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'blockquote'
    | 'table'
    | 'list'
    | 'inlineCode'
    | 'lead'
    | 'large'
    | 'small'
    | 'muted';
  className?: string;
  children: React.ReactNode;
};

export const Typography: React.FC<TypographyProps> = ({ variant, className, children }) => {
  switch (variant) {
    case 'h1':
      return (
        <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}>{children}</h1>
      );
    case 'h2':
      return (
        <h2 className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}>
          {children}
        </h2>
      );
    case 'h3':
      return <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}>{children}</h3>;
    case 'h4':
      return <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}>{children}</h4>;
    case 'p':
      return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>{children}</p>;
    case 'blockquote':
      return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)}>{children}</blockquote>;
    case 'table':
      return (
        <div className={cn('my-6 w-full overflow-y-auto', className)}>
          <table className="w-full">{children}</table>
        </div>
      );
    case 'list':
      return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}>{children}</ul>;
    case 'inlineCode':
      return (
        <code
          className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
        >
          {children}
        </code>
      );
    case 'lead':
      return <p className={cn('text-xl text-muted-foreground', className)}>{children}</p>;
    case 'large':
      return <div className={cn('text-lg font-semibold', className)}>{children}</div>;
    case 'small':
      return <small className={cn('text-sm font-medium leading-none', className)}>{children}</small>;
    case 'muted':
      return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
    default:
      return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>{children}</p>;
  }
};
