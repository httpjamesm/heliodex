<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Pages } from "$lib/pages";

  onMount(() => {
    if (window.localStorage.getItem("onboarding")) {
      goto(Pages.Home);
    } else {
      goto(Pages.Landing);
    }
  });
</script>
