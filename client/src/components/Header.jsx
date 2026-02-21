// <Header title = "MyTitle" />


export default function Header(props) {
  return (
    <div className="text-center my-4">
      <h1>{props.title}</h1>
    </div>
  );
}