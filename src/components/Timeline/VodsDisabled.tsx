const VodsDisabled = () => (
  <>
    <h1>No clips for the given vod</h1>
    <p>
      Clips were found for the time period, but they don't have a VOD
      associated. This usually happens when automatic VOD saving is disabled. If
      during the stream the vods are hidden, clips created during the stream
      will not have the VOD associated, even if the VOD is later published.
    </p>
    <p>
      You can easily check this, because all the clips created for the
      corresponding stream while the VOD wasn't available do not have the "Watch
      Full Video" option available
    </p>
    <p>To fix this, VODs must be visible when the stream starts.</p>
  </>
);

export default VodsDisabled;
