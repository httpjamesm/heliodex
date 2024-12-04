<script lang="ts">
  import { IconArrowRight } from "@tabler/icons-svelte";
  interface Props {
    name: string;
    hours: number;
    id: number;
    onclick?: () => void;
  }

  const { name, hours, id, onclick }: Props = $props();

  const getColorFromName = (name: string) => {
    const hash = Array.from(name).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  const color = $derived(getColorFromName(name));
  const formattedHours = $derived(hours.toFixed(2));
</script>

<a class="card" href={`/track?project_id=${id}`} {onclick}>
  <div class="color-bar" style:background-color={color}></div>
  <div class="content">
    <h2>{name}</h2>
    <p>{formattedHours} hours <span>so far</span></p>
  </div>
  <div class="arrow"><IconArrowRight /></div>
</a>

<style lang="scss">
  .card {
    background: var(--surface-color);
    border-radius: 1rem;
    padding: 1.5rem;
    box-sizing: border-box;
    margin: 0.5rem 0;
    display: flex;
    gap: 1rem;
    text-decoration: none;
    color: inherit;
    position: relative;
    border: 1px solid var(--surface-border-color);
    overflow: hidden;
  }

  .color-bar {
    width: 4px;
    border-radius: 2px;
  }

  .content {
    flex: 1;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    p {
      font-size: 1rem;
      margin: 0.25rem 0 0;
      color: white;

      span {
        color: #888;
      }
    }
  }

  .arrow {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    opacity: 0.5;
  }
</style>
