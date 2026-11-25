import styles from "./family-profiles.module.scss";
import Image from "next/image";
import type { AvatarId } from "./model";

export const avatarLabels: Record<AvatarId, string> = {
  man: "С гантелью", woman: "На прогулке", child: "С мячом",
};

export function MemberAvatar({ avatarId, displayName, className = styles.avatar }: {
  avatarId?: AvatarId;
  displayName: string;
  className?: string;
}) {
  return avatarId ? <Image className={className} src={`/family/${avatarId}.webp`} alt=""
    width={800} height={avatarId === "child" ? 1038 : 1391} sizes="(max-width: 760px) 40vw, 240px" />
    : <span className={`${styles.monogram} ${className}`} aria-hidden="true">{Array.from(displayName.trim())[0] || "П"}</span>;
}
